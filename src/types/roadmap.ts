export interface RoadmapStep {
  title: string;
  desc: string;
  finished: boolean;
}

export interface RoadmapPhase {
  phase: string;
  status: 'completed' | 'working on' | 'planned';
  steps: RoadmapStep[];
}

export type RoadmapData = RoadmapPhase[];
