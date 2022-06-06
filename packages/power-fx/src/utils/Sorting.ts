export class Sorting {
  public static RemoveDupsFromSorted<T>(rgv: T[], ivMin: number, ivLim: number, cmp: (src: T, dst: T) => boolean) {
    if (ivLim - ivMin <= 1) {
      return ivLim
    }
    let ivDst = ivMin + 1
    for (let ivSrc = ivMin + 1; ivSrc < ivLim; ivSrc++) {
      const itemCur = rgv[ivSrc]
      if (!cmp(rgv[ivDst - 1], itemCur)) {
        if (ivDst < ivSrc) {
          rgv[ivDst] = itemCur
        }
        ivDst++
      }
    }
    return ivDst
  }
  public static Sort<T>(rgv: T[], compare: (src: T, dst: T) => number) {
    return rgv.sort(compare)
  }
}
