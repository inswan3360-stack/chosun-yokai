import { yokaiSchema } from '../data/monsters.js';

// This is a simplified, framework-agnostic custom hook-like module.
export function useYokai(yokaiId) {
  let yokaiData = { ...yokaiSchema };

  // In a real app, you would fetch this from Firestore
  console.log(`Fetching yokai data for ID: ${yokaiId}`);

  const hungerInterval = setInterval(() => {
    yokaiData.hunger = Math.max(0, yokaiData.hunger - 1);
    console.log(`Hunger of ${yokaiData.name}: ${yokaiData.hunger}`);
  }, 60000); // 1 minute

  // Function to stop the interval when the component unmounts
  function cleanup() {
    clearInterval(hungerInterval);
  }

  return { yokaiData, cleanup };
}
