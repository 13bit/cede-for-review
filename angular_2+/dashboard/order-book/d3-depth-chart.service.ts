import {Injectable} from '@angular/core';
import * as d3 from 'd3';
import {OrderBookItem} from '@app/shared/model/order-book-item';

@Injectable()
export class D3DepthChartService {

  constructor() {
  }

  getXScale(width: number): any {
    return d3.scaleLinear()
      .rangeRound([0, width]);
  }

  getYScale(height: number): any {
    return d3.scaleLinear()
      .rangeRound([height, 0]);
  }

  getLine(x, y): any {
    return d3.line()
      .x((item: OrderBookItem) => x(item.price))
      .y((item: OrderBookItem) => y(item.volume));
  }

  getArea(x, y0, y1): any {
    return d3.area()
      .x((item: OrderBookItem) => x(item.price))
      .y0(y0)
      .y1((item: OrderBookItem) => y1(item.volume));
  }

  getPriceBisector() {
    return d3.bisector(({price}) => price).left;
  }

  drawTooltip(elementSVG: any, margin: any) {
    this.removeTooltip();

    const focus = elementSVG.append('g')
      .attr('class', 'chart-tooltip__focus');

    focus.append('circle')
      .attr('r', 5)
      .attr('class', 'chart-tooltip__circle')
      .attr('transform', `translate(${margin.left}, ${margin.top })`);

    focus.append('rect')
      .attr('class', 'chart-tooltip__popup_hover')
      .attr('transform', `translate(${margin.left - 60}, ${margin.top - 65})`);

    const focusText = focus.append('text')
      .attr('transform', `translate(${margin.left - 60}, ${margin.top - 65})`)
      .attr('dy', '.35em');

    focusText.append('tspan')
      .attr('class', 'chart-tooltip-popup__price-text')
      .attr('dy', '.35em')
      .attr('x', 10)
      .attr('y', 12.5);

    focusText.append('tspan')
      .attr('class', 'chart-tooltip-popup__volume-text')
      .attr('dy', '.35em')
      .attr('x', 10)
      .attr('y', 30);

    return focus;
  }

  removeTooltip(): void {
    d3.selectAll('g.chart-tooltip__focus').remove();
  }

  drawBidArea(elementSVG: any, data: OrderBookItem[], area: any, line: any): any {
    elementSVG.append('path')
      .datum(data)
      .attr('class', 'chart-bid-area')
      .attr('d', area);

    elementSVG.append('path')
      .datum(data)
      .attr('class', 'chart-line chart-bid-line')
      .attr('d', line);

    return elementSVG;
  }

  drawAskArea(elementSVG: any, data: OrderBookItem[], area: any, line: any): any {
    elementSVG.append('path')
      .datum(data)
      .attr('class', 'chart-ask-area')
      .attr('d', area);

    elementSVG.append('path')
      .datum(data)
      .attr('class', 'chart-line chart-ask-line')
      .attr('d', line);

    return elementSVG;
  }

}
