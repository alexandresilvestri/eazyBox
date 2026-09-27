import type { Knex } from 'knex'

const BOX_WORKOUTS = [
  {
    id: 'f4615e1d-7189-4e22-9d23-d2419b35ef3b',
    warm_up: '3 rounds: 200m corrida, 10 air squats, 10 pass through',
    skill: 'Thruster - 5x3 subindo carga',
    wod: 'Fran\n21-15-9\nThruster 43/30kg\nPull-up',
  },
  {
    id: '700ea767-d3e2-43cb-af21-492a27abd017',
    warm_up: '400m corrida leve + mobilidade de ombro',
    skill: 'Kipping pull-up - 5x5',
    wod: 'Cindy\nAMRAP 20min\n5 pull-ups\n10 push-ups\n15 air squats',
  },
  {
    id: 'ef3c0e4a-453b-4402-bb44-1bf535f9da37',
    warm_up: '2 rounds: 250m remo, 10 good mornings, 10 lunges',
    skill: 'Kettlebell swing americano - técnica',
    wod: 'Helen\n3 rounds\n400m corrida\n21 KB swing 24/16kg\n12 pull-ups',
  },
  {
    id: 'a34f30aa-720a-41b9-b68d-074df68100a9',
    warm_up: '3 rounds: 15 jumping jacks, 10 PVC push press, 10 sit-ups',
    skill: 'Clean and jerk - progressão',
    wod: 'Grace\n30 clean and jerk 61/43kg\nFor time',
  },
  {
    id: '8cf7edcc-1f4c-4eb1-9eb9-9a0903e946b8',
    warm_up: '800m corrida leve + mobilidade de quadril e ombro',
    skill: 'Strict pull-up e push-up - técnica e escalas',
    wod: 'Murph\n1600m corrida\n100 pull-ups\n200 push-ups\n300 air squats\n1600m corrida\nColete 9/6kg',
  },
]

export async function up(knex: Knex): Promise<void> {
  if (process.env.NODE_ENV === 'test') return

  await knex('workouts').insert(BOX_WORKOUTS).onConflict('id').ignore()
}

export async function down(knex: Knex): Promise<void> {
  await knex('workouts')
    .whereIn(
      'id',
      BOX_WORKOUTS.map((workout) => workout.id)
    )
    .whereNotExists((builder) =>
      builder
        .select(knex.raw('1'))
        .from('workout_sessions')
        .whereRaw('workout_sessions.workout_id = workouts.id')
    )
    .delete()
}
