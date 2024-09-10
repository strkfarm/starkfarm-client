import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

export default class MyNumber {
  bigNumber: BigNumber;
  decimals: number;

  constructor(bigNumber: string, decimals: number) {
    this.bigNumber = new BigNumber(bigNumber);
    this.decimals = decimals;
  }

  static fromEther(num: string, decimals: number) {
    try {
      return new MyNumber(
        Number(ethers.parseUnits(num, decimals)).toFixed(6),
        decimals,
      );
    } catch (e) {
      console.error('fromEther', e, num, decimals);
      throw e;
    }
  }

  static fromZero() {
    return new MyNumber('0', 0);
  }

  toString() {
    return this.bigNumber.toFixed();
  }

  toEtherStr() {
    if (this.isMaxUint256()) {
      return 'MAX';
    }
    return ethers.formatUnits(this.bigNumber.toFixed(), this.decimals);
  }

  toFixedStr(decimals: number) {
    if (this.isMaxUint256()) {
      return 'MAX';
    }
    return Number(this.toEtherStr()).toFixed(decimals);
  }

  toEtherToFixedDecimals(decimals: number) {
    if (this.isMaxUint256()) {
      return 'MAX';
    }
    // rounding down
    return (
      Math.floor(parseFloat(this.toEtherStr()) * 10 ** decimals) /
      10 ** decimals
    ).toFixed(decimals);
  }

  isZero() {
    return this.bigNumber.eq('0');
  }

  eq(other: MyNumber) {
    return this.bigNumber.eq(other.bigNumber);
  }

  /**
   *
   * @param amountEther in token terms without decimal e.g. 1 for 1 STRK
   * @param command BigNumber compare funds. e.g. gte, gt, lt
   * @returns
   * @dev Add more commands as needed
   */
  compare(amountEther: string, command: 'gte' | 'gt' | 'lt') {
    if (this.isMaxUint256()) {
      return command === 'lt'; // MAX is never less than any value
    }
    if (amountEther === 'MAX') {
      return this.bigNumber[command](MyNumber.MAX_UINT256.bigNumber);
    }
    const fullNum = new BigNumber(
      ethers.parseUnits(amountEther, this.decimals).toString(),
    );
    return this.bigNumber[command](fullNum);
  }

  operate(command: 'div' | 'plus', value: string | number) {
    const bn = new BigNumber(Number(value).toFixed(6));
    return new MyNumber(this.bigNumber[command](bn).toFixed(0), this.decimals);
  }

  subtract(value: MyNumber) {
    const bn = this.bigNumber.minus(value.bigNumber);
    return new MyNumber(bn.toString(), this.decimals);
  }

  static min(a: MyNumber, b: MyNumber) {
    if (a.decimals !== b.decimals) {
      const diff = Math.abs(a.decimals - b.decimals);
      if (a.decimals > b.decimals) {
        b = new MyNumber(b.bigNumber.times(10 ** diff).toString(), a.decimals);
      } else {
        a = new MyNumber(a.bigNumber.times(10 ** diff).toString(), b.decimals);
      }
    }
    const bn = BigNumber.min(a.bigNumber, b.bigNumber);
    return new MyNumber(
      bn.toString(),
      a.decimals > b.decimals ? a.decimals : b.decimals,
    );
  }

  static max(a: MyNumber, b: MyNumber) {
    if (a.decimals !== b.decimals) {
      const diff = Math.abs(a.decimals - b.decimals);
      if (a.decimals > b.decimals) {
        b = new MyNumber(b.bigNumber.times(10 ** diff).toString(), a.decimals);
      } else {
        a = new MyNumber(a.bigNumber.times(10 ** diff).toString(), b.decimals);
      }
    }
    const bn = BigNumber.max(a.bigNumber, b.bigNumber);
    return new MyNumber(
      bn.toString(),
      a.decimals > b.decimals ? a.decimals : b.decimals,
    );
  }

  static MAX_UINT256 = new MyNumber(
    '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    0,
  );

  isMaxUint256() {
    return this.eq(MyNumber.MAX_UINT256);
  }

  [customInspectSymbol](depth: any, inspectOptions: any, inspect: any) {
    return JSON.stringify({ raw: this.toString(), decimals: this.decimals });
  }
}
