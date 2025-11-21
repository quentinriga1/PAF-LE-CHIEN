import { Environment } from './types';

export const GRAVITY = 0.4;
export const GROUND_Y_OFFSET = 100;

export const ENVIRONMENTS: Environment[] = [
  {
    name: "City",
    sky: '#2980b9', // Darker blue for gradient top
    ground: '#34495e', // Asphalt
    groundDetail: '#95a5a6', // Sidewalk
    decoType: 'building',
    decoColor: '#7f8c8d'
  },
  {
    name: "Countryside",
    sky: '#6DD5FA', // Bright Blue
    ground: '#7DCEA0', // Grass
    groundDetail: '#27AE60', // Darker Grass Edge
    decoType: 'tree',
    decoColor: '#229954'
  },
  {
    name: "Mountains",
    sky: '#2c3e50', // Dark slate
    ground: '#bdc3c7', // Snow/Rock
    groundDetail: '#ecf0f1', // Snow top
    decoType: 'mountain',
    decoColor: '#7f8c8d'
  },
  {
    name: "Beach",
    sky: '#FF9966', // Sunset Orange
    ground: '#F9E79F', // Sand
    groundDetail: '#F4D03F', // Wet Sand
    decoType: 'palm',
    decoColor: '#D35400'
  }
];