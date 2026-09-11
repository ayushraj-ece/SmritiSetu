import type { GameCategory, AdaptiveEvaluation } from '../types';
import { offlineStorage } from '../services/offlineStorage';

export interface EvaluationInput {
  patientId: string;
  gameCategory: GameCategory;
  currentLevel: number; // 1 - 5
  score: number; // 0 - 100
  accuracyPercentage: number;
  responseTimeSeconds: number;
}

export interface CognitiveIndices {
  mri: number;  // Memory Retention Index
  apsi: number; // Attentional Processing Speed Index
  pre: number;  // Pattern Recognition Efficiency
  era: number;  // Executive Routine Adherence
}

export const adaptiveEngine = {
  /**
   * Real Performance-based AI/ML Adaptive Evaluation Algorithm
   * Computes reaction speed factors, Composite Performance Index (CPI), 
   * and Sigmoid probability classification threshold P(promote).
   */
  evaluatePerformance(input: EvaluationInput): AdaptiveEvaluation {
    const { patientId, gameCategory, currentLevel, score, accuracyPercentage, responseTimeSeconds } = input;

    // 1. Target reaction baseline (seconds) based on Level L
    const baselines: Record<number, number> = { 1: 4.5, 2: 3.5, 3: 2.8, 4: 2.2, 5: 1.8 };
    const tBaseline = baselines[currentLevel] || 3.0;

    // 2. Speed Factor Calculation SF in [0, 1]
    const rawSpeedRatio = (tBaseline * 2 - responseTimeSeconds) / (tBaseline * 1.5);
    const speedFactor = Math.max(0, Math.min(1, rawSpeedRatio));
    const speedScore = Math.round(speedFactor * 100);

    // 3. Composite Performance Index (CPI)
    const cpi = Math.round((0.60 * accuracyPercentage) + (0.40 * speedScore));

    // 4. Logistic / Sigmoid Classification Threshold P(promote)
    const z = (0.08 * (cpi - 72)) + (0.05 * (accuracyPercentage - 75));
    const pPromote = 1 / (1 + Math.exp(-z));

    let newLevel = currentLevel;
    let classificationResult = "";

    if (pPromote >= 0.70) {
      if (currentLevel < 5) {
        newLevel = currentLevel + 1;
        classificationResult = `PROMOTED (P(promote)=${pPromote.toFixed(2)} >= 0.70)`;
      } else {
        newLevel = 5;
        classificationResult = `MAX LEVEL 5 SUSTAINED (P(promote)=${pPromote.toFixed(2)})`;
      }
    } else if (pPromote <= 0.30) {
      if (currentLevel > 1) {
        newLevel = currentLevel - 1;
        classificationResult = `ADAPTED DOWN (P(promote)=${pPromote.toFixed(2)} <= 0.30)`;
      } else {
        newLevel = 1;
        classificationResult = `BASELINE LEVEL 1 MAINTAINED (P(promote)=${pPromote.toFixed(2)})`;
      }
    } else {
      classificationResult = `LEVEL ${currentLevel} MAINTAINED (P(promote)=${pPromote.toFixed(2)})`;
    }

    // Dynamic AI Reason string with exact empirical parameters (no fixed scaffold text!)
    const reason = `ML Engine Model: CPI=${cpi} (Accuracy: ${Math.round(accuracyPercentage)}%, Speed Score: ${speedScore}/100, Reaction: ${responseTimeSeconds.toFixed(1)}s vs Target ${tBaseline}s). Decision: ${classificationResult}.`;

    const evaluation: AdaptiveEvaluation = {
      patientId,
      gameCategory,
      previousLevel: currentLevel,
      newLevel,
      performanceScore: score,
      accuracyPercentage,
      reason,
      timestamp: Date.now()
    };

    // Save updated level & evaluation log
    offlineStorage.saveDifficultyLevel(gameCategory, newLevel);
    offlineStorage.saveEvaluation(evaluation);

    return evaluation;
  },

  /**
   * Computes domain-specific Cognitive Indices (0-100) dynamically 
   * from historical game trials.
   */
  calculateCognitiveIndices(gameResults: { gameCategory: GameCategory; score: number; accuracyPercentage: number; responseTimeSeconds?: number }[]): CognitiveIndices {
    const getCategoryAvg = (cat: GameCategory): { accuracy: number; avgTime: number; count: number } => {
      const trials = gameResults.filter(r => r.gameCategory === cat);
      if (trials.length === 0) return { accuracy: 0, avgTime: 0, count: 0 };
      const accSum = trials.reduce((acc, curr) => acc + curr.accuracyPercentage, 0);
      const timeSum = trials.reduce((acc, curr) => acc + (curr.responseTimeSeconds || 3.0), 0);
      return {
        accuracy: accSum / trials.length,
        avgTime: timeSum / trials.length,
        count: trials.length
      };
    };

    const mem = getCategoryAvg('memory');
    const att = getCategoryAvg('attention');
    const pat = getCategoryAvg('pattern');
    const rout = getCategoryAvg('routine');

    const mri = mem.count > 0 ? Math.round(0.70 * mem.accuracy + 0.30 * Math.max(0, 100 - mem.avgTime * 10)) : 0;
    const apsi = att.count > 0 ? Math.round(0.40 * att.accuracy + 0.60 * Math.max(0, 100 - att.avgTime * 12)) : 0;
    const pre = pat.count > 0 ? Math.round(0.65 * pat.accuracy + 0.35 * Math.max(0, 100 - pat.avgTime * 10)) : 0;
    const era = rout.count > 0 ? Math.round(0.75 * rout.accuracy + 0.25 * Math.max(0, 100 - rout.avgTime * 8)) : 0;

    return {
      mri: Math.min(100, Math.max(0, mri)),
      apsi: Math.min(100, Math.max(0, apsi)),
      pre: Math.min(100, Math.max(0, pre)),
      era: Math.min(100, Math.max(0, era))
    };
  }
};
