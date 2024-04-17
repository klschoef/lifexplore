export class RangeValueUtil {
  // Regular expression to get groups of value, -value, +value, or +-value:
  // example: 0.2+0.2-3.4 = 0.2, +0.2, -3.4
  private static REGEX_RANGE_PARTS: RegExp = /([+-]?([+-]{0,2}\d+\.{0,1}\d*)|\+|-)/g;

  /**
   * Gets a minimum and maximum value from a string that contains a range of values like 0.5+-0.1 or 0.5-0.1+0.1.
   * String Format: [base_value][+-][range_value][+-][range_value]...
   * Examples:
   *   range from 0.5 to 0.6: 0.5+0.1
   *   range from 0.4 to 0.6: 0.5+-0.1 or 0.5-0.1+0.1
   *   range from 0.5 to infinity: 0.5+
   */
  public static parseRangeValues(valueRangeString: string): {min?: number, max?: number} | undefined {
    const rangeFindings = Array.from(valueRangeString.matchAll(RangeValueUtil.REGEX_RANGE_PARTS));
    if (rangeFindings.length === 0) {
      console.log(`No range findings found for ${valueRangeString}`);
      return undefined;
    }

    // Only take the first group of each finding
    const rangeValues = rangeFindings.map(fin => fin[0]);

    let value = parseFloat(rangeValues[0]);
    let minVal: number | undefined = value;
    let maxVal: number | undefined = value;

    for (const rangeVal of rangeValues.slice(1)) {
      if (rangeVal.startsWith("+-")) {
        if (rangeVal.length === 2) {
          maxVal = undefined;
          minVal = undefined;
        } else {
          const parsedValue = parseFloat(rangeVal.slice(2));
          if (maxVal !== undefined) maxVal += parsedValue;
          if (minVal !== undefined) minVal -= parsedValue;
        }
      } else if (rangeVal.startsWith("+")) {
        if (rangeVal.length === 1) {
          maxVal = undefined;
        } else {
          maxVal = maxVal !== undefined ? maxVal + parseFloat(rangeVal.slice(1)) : undefined;
        }
      } else if (rangeVal.startsWith("-")) {
        if (rangeVal.length === 1) {
          minVal = undefined;
        } else {
          minVal = minVal !== undefined ? minVal - parseFloat(rangeVal.slice(1)) : undefined;
        }
      }
    }

    return {
      min: minVal,
      max: maxVal};
  }
}
