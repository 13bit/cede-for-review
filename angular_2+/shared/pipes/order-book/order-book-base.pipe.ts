export class OrderBookBasePipe {
  prepareFractionPart(fractionPart: string, fractionPartLength: number): string {
    if (!fractionPart) {
      fractionPart = '0'.repeat(fractionPartLength);
    } else {
      fractionPart = fractionPart.slice(0, fractionPartLength);

      if (fractionPartLength > fractionPart.length) {
        fractionPart = fractionPart + '0'.repeat(fractionPartLength - fractionPart.length);
      }
    }

    return fractionPart;
  }
}
