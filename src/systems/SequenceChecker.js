/**
 * dragPath가 skillSequence를 연속 부분 배열로 포함하면 true.
 * @param {string[]} dragPath - 드래그한 젬 타입 순서
 * @param {string[]} skillSequence - 캐릭터 스킬 필요 시퀀스
 * @returns {boolean}
 */
export function checkSequence(dragPath, skillSequence) {
  if (dragPath.length < skillSequence.length) return false
  const seqLen = skillSequence.length
  for (let i = 0; i <= dragPath.length - seqLen; i++) {
    let match = true
    for (let j = 0; j < seqLen; j++) {
      if (dragPath[i + j] !== skillSequence[j]) {
        match = false
        break
      }
    }
    if (match) return true
  }
  return false
}
