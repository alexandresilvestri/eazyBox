import type { Knex } from 'knex'

const WORKOUTS = [
  {
    warmUp: '3 rounds: 200m corrida, 10 air squats, 10 pass through',
    skill: 'Thruster - 5x3 subindo carga',
    wod: 'Fran\n21-15-9\nThruster 43/30kg\nPull-up',
  },
  {
    warmUp: '400m corrida leve + mobilidade de ombro',
    skill: 'Kipping pull-up - 5x5',
    wod: 'Cindy\nAMRAP 20min\n5 pull-ups\n10 push-ups\n15 air squats',
  },
  {
    warmUp: '2 rounds: 250m remo, 10 good mornings, 10 lunges',
    skill: 'Kettlebell swing americano - técnica',
    wod: 'Helen\n3 rounds\n400m corrida\n21 KB swing 24/16kg\n12 pull-ups',
  },
  {
    warmUp: '3 rounds: 15 jumping jacks, 10 PVC push press, 10 sit-ups',
    skill: 'Clean and jerk - progressão',
    wod: 'Grace\n30 clean and jerk 61/43kg\nFor time',
  },
  {
    warmUp: '500m remo + mobilidade de quadril',
    skill: 'Deadlift - 5x3 @ 70%',
    wod: 'Diane\n21-15-9\nDeadlift 102/70kg\nHandstand push-up',
  },
  {
    warmUp: '3 rounds: 10 burpees, 10 hollow rocks',
    skill: 'Double under - 5x30s',
    wod: 'Annie\n50-40-30-20-10\nDouble under\nSit-up',
  },
  {
    warmUp: '400m corrida + 2 rounds de 10 air squats e 10 ring rows',
    skill: 'Back squat - 5x5',
    wod: 'Barbara\n5 rounds\n20 pull-ups\n30 push-ups\n40 sit-ups\n50 air squats\n3min descanso entre rounds',
  },
  {
    warmUp: '3 rounds: 200m corrida, 10 wall balls leves',
    skill: 'Wall ball - altura e ritmo',
    wod: 'Karen\n150 wall balls 9/6kg\nFor time',
  },
  {
    warmUp: '2 rounds: 250m remo, 10 muscle clean, 10 front squat',
    skill: 'Front squat - 4x4',
    wod: 'Elizabeth\n21-15-9\nClean 61/43kg\nRing dip',
  },
  {
    warmUp: '3 rounds: 10 inchworm, 10 scapular pull-ups',
    skill: 'Toes to bar - 5x8',
    wod: 'AMRAP 15min\n10 toes to bar\n15 box jump 60/50cm\n20 KB swing 24/16kg',
  },
  {
    warmUp: '600m corrida + mobilidade de tornozelo',
    skill: null,
    wod: 'Murph\n1600m corrida\n100 pull-ups\n200 push-ups\n300 air squats\n1600m corrida\nColete 9/6kg',
  },
  {
    warmUp: '3 rounds: 15 cal bike, 10 PVC snatch',
    skill: 'Power snatch - 6x2',
    wod: 'Isabel\n30 snatch 61/43kg\nFor time',
  },
  {
    warmUp: '2 rounds: 200m corrida, 10 lunges, 10 push-ups',
    skill: 'Handstand hold - 4x30s',
    wod: 'EMOM 20min\nPar: 12 cal remo\nImpar: 10 burpees over the bar',
  },
  {
    warmUp: '400m corrida + 3 rounds de 10 empty bar thruster',
    skill: 'Overhead squat - 5x3',
    wod: 'Nancy\n5 rounds\n400m corrida\n15 overhead squat 43/30kg',
  },
  {
    warmUp: '3 rounds: 250m remo, 10 hip extension',
    skill: 'Power clean - 5x2 pesado',
    wod: 'Linda\n10-9-8-7-6-5-4-3-2-1\nDeadlift 1.5x peso corporal\nBench press peso corporal\nClean 0.75x peso corporal',
  },
  {
    warmUp: null,
    skill: 'Snatch balance - 5x3',
    wod: 'AMRAP 12min\n5 power snatch 52/35kg\n10 box over 60/50cm\n15 sit-ups',
  },
  {
    warmUp: '3 rounds: 200m corrida, 10 air squats, 5 strict pull-ups',
    skill: 'Muscle-up - progressão em anéis',
    wod: 'Amanda\n9-7-5\nMuscle-up\nSnatch 61/43kg',
  },
  {
    warmUp: '500m remo + mobilidade torácica',
    skill: 'Push press - 5x5',
    wod: 'Jackie\n1000m remo\n50 thrusters 20kg\n30 pull-ups',
  },
  {
    warmUp: '3 rounds: 10 burpees, 15 cal bike, 10 lunges',
    skill: null,
    wod: 'Chipper\n50 wall balls 9/6kg\n40 cal remo\n30 toes to bar\n20 burpee box jump\n10 clean and jerk 70/47kg',
  },
  {
    warmUp: '400m corrida + 2 rounds de 10 ring rows e 10 push-ups',
    skill: 'Bench press - 5x5',
    wod: 'For time\n21-15-9\nDeadlift 84/57kg\nBurpee over the bar\n800m corrida no final',
  },
]

export async function seed(knex: Knex) {
  await knex('workouts').insert(WORKOUTS)
}
