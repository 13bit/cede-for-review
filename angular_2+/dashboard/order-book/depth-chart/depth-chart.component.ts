import {Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import * as d3 from 'd3';
import {DashboardService} from '@app/dashboard/dashboard.service';
import {OrderBookService} from '@app/dashboard/order-book/order-book.service';
import {D3DepthChartService} from '@app/dashboard/order-book/d3-depth-chart.service';
import {Moment} from 'moment';
import * as moment from 'moment';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-depth-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './depth-chart.component.html',
  styleUrls: ['./depth-chart.component.css']
})
export class DepthChartComponent implements OnInit, OnDestroy {
  margin: { top: number, right: number, bottom: number, left: number };
  chartWidth: number;
  chartHeight: number;
  chartIsInited: boolean;
  timerStartedAt: Moment;
  orderBookIsUpdated: boolean;
  chartSVG: any;

  orderBookSubscription$: Subscription;

  @ViewChild('depthChart') depthChart: ElementRef;

  constructor(private dashboardService: DashboardService,
              private orderBookService: OrderBookService,
              private depthChartService: D3DepthChartService) {
  }

  ngOnInit(): void {
    this.margin = {top: 10, right: 20, bottom: 30, left: 30};

    this.depthChart.nativeElement.setAttribute('height', 220);
    this.depthChart.nativeElement.setAttribute('width', this.getWidth());

    this.chartSVG = d3.select('svg');

    this.chartWidth = this.calculateChartWidth();
    this.chartHeight = this.calculateChartHeight();

    this.dashboardService.orderBookIsLoaded$
      .subscribe(() => {
        if (this.orderBookSubscription$) {
          this.orderBookSubscription$.unsubscribe();
        }

        this.orderBookIsUpdated = true;
        this.timerStartedAt = moment();

        this.orderBookSubscription$ = this.dashboardService.orderBook$
          .subscribe(({bid, ask}) => {

            if (bid.length && ask.length) {
              if (!this.chartIsInited) {
                this.initChart(bid, ask);
                this.chartIsInited = true;
              } else {
                if (this.chartIsReadyForReDraw() || this.orderBookIsUpdated) {
                  this.reDrawChart(bid, ask);
                  this.orderBookIsUpdated = false;
                }
              }
            }
          });
      });
  }

  ngOnDestroy(): void {
    this.orderBookSubscription$.unsubscribe();
  }

  initChart(bidItems, askItems): void {
    this.chartSVG.append('rect')
      .attr('class', 'chart-container');

    this.drawChart(bidItems, askItems);
  }

  chartIsReadyForReDraw(): boolean {
    const now = moment();

    if (!this.timerStartedAt) {
      this.timerStartedAt = moment();
      return false;
    }

    if (now.diff(this.timerStartedAt, 'second') >= 30) {
      this.timerStartedAt = moment();

      return true;
    }
  }

  reDrawChart(bidItems, askItems): void {
    this.removeChart();

    if (bidItems.length && askItems.length) {
      this.drawChart(bidItems, askItems);
    }
  }

  public getWidth(): number {
    switch (window.innerWidth) {
      case 1366:
        return 320;
      case 1440:
        return 350;
      case 1600:
        return 380;
      case 1920:
        return 460;
      default:
        return 380;
    }
  }

  drawChart(bidItems, askItems): void {
    let g = this.chartSVG.append('g')
      .attr('class', 'svg-container')
      .attr('transform', `translate(${this.margin.left + 2}, ${this.margin.top})`);

    const dataBid = bidItems
      .slice()
      .filter(({amount}) => amount > 0);

    const dataAsk = askItems
      .slice()
      .filter(({amount}) => amount > 0);

    const x = this.depthChartService.getXScale(this.chartWidth);
    const y = this.depthChartService.getYScale(this.chartHeight);

    x.domain(this.orderBookService.preparePriceScale({bid: dataBid, ask: dataAsk}));
    y.domain(this.orderBookService.prepareVolumeScale({bid: dataBid, ask: dataAsk}));

    const line = this.depthChartService.getLine(x, y);
    const area = this.depthChartService.getArea(x, this.chartHeight, y);

    const xAxis = d3.axisBottom(x)
      .ticks(5);

    const yAxis = d3.axisLeft(y)
      .tickFormat((d) => {
        if (d >= 100000) {
          d = `${d / 1000000}m`;
        } else if (d >= 1000) {
          d = `${d / 1000}k`;
        }

        return d;
      });

    g.append('g')
      .attr('transform', `translate(0,${this.chartHeight})`)
      .attr('class', 'chart-scale')
      .call(xAxis);

    g.append('g')
      .attr('class', 'chart-scale')
      .call(yAxis);

    g = this.depthChartService.drawBidArea(g, dataBid, area, line);
    g = this.depthChartService.drawAskArea(g, dataAsk, area, line);

    this.depthChartService.removeTooltip();
    const focus = this.depthChartService.drawTooltip(this.chartSVG, this.margin);

    const bisectPrice = this.depthChartService.getPriceBisector();

    const data = dataBid
      .reverse()
      .concat(dataAsk);

    d3.selectAll('.chart-mouse-event-overlay').remove();
    const self = this;

    this.chartSVG.append('rect')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
      .attr('class', 'chart-mouse-event-overlay')
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight)
      .on('mouseover', () => focus.style('display', 'block'))
      .on('mouseout', () => focus.style('display', 'none'))
      .on('mousemove', function () {
        const x0 = x.invert(d3.mouse(this)[0]);
        const i = bisectPrice(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const d = x0 - d0.price > d1.price - x0 ? d1 : d0;

        focus
          .attr('transform', `translate(${x(d.price)},${y(d.volume)})`);

        if (self.isExponent(d.price)) {
          d.price = self.exponentToFixed(d.price);
        }

        focus
          .select('tspan.chart-tooltip-popup__price-text')
          .text(`Price: ${d.price}`);
        focus
          .select('tspan.chart-tooltip-popup__volume-text')
          .text(`Volume: ${d.volume.toFixed(2)}`);
      });
  }

  private removeChart(): void {
    d3.select('g.svg-container').remove();
  }

  private calculateChartHeight(): number {
    return +this.chartSVG.attr('height') - this.margin.top - this.margin.bottom;
  }

  private calculateChartWidth(): number {
    return +this.chartSVG.attr('width') - this.margin.left - this.margin.right;
  }

  private isExponent(number: number): boolean {
    return number.toString().includes('e');
  }

  private exponentToFixed(number: number): string {
    return number.toFixed(8);
  }

}
