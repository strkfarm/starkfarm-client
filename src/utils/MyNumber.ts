import BigNumber from "bignumber.js";
import { ethers } from "ethers";

export default class MyNumber {
    bigNumber: BigNumber;
    decimals: number;

    constructor(bigNumber: string, decimals: number) {
        this.bigNumber = new BigNumber(bigNumber);
        this.decimals = decimals;
    }

    static fromEther(num: string, decimals: number) {
        return new MyNumber(ethers.parseUnits(num, decimals).toString(), decimals);
    }

    static fromZero() {
        return new MyNumber('0', 0);
    }

    toString() {
        return this.bigNumber.toFixed();
    }
    
    toEtherStr() {
        return ethers.formatUnits(this.bigNumber.toFixed(), this.decimals);
    }

    toEtherToFixedDecimals(decimals: number) {
        // rounding down
        return (Math.floor(parseFloat(this.toEtherStr()) * (10 ** decimals)) / (10 ** decimals)).toFixed(decimals);
    }

    isZero() {
        return this.bigNumber.eq('0')
    }

    /**
     * 
     * @param amountEther in token terms without decimal e.g. 1 for 1 STRK
     * @param command BigNumber compare funds. e.g. gte, gt, lt
     * @returns 
     * @dev Add more commands as needed
     */
    compare(amountEther: string, command: 'gte' | 'gt' | 'lt') {
        const fullNum = new BigNumber(ethers.parseUnits(amountEther, this.decimals).toString());
        return this.bigNumber[command](fullNum);
    }

    static min(a: MyNumber, b: MyNumber) {
        if (!a.isZero() && !b.isZero())
            if (a.decimals != b.decimals) throw new Error(`Cannot compare numbers of diff decimals: a:${a.decimals}, b:${b.decimals}`)
        const bn = BigNumber.min(a.bigNumber, b.bigNumber);
        return new MyNumber(bn.toString(), a.decimals);
    }
}