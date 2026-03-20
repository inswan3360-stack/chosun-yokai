export function calculateMBTI(answers) {
  const scores = {
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
  };

  for (const answer of answers) {
    scores[answer]++;
  }

  let mbti = "";
  mbti += scores.E > scores.I ? "E" : "I";
  mbti += scores.S > scores.N ? "S" : "N";
  mbti += scores.T > scores.F ? "T" : "F";
  mbti += scores.J > scores.P ? "J" : "P";

  return mbti;
}
