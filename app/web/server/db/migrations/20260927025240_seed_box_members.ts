import type { Knex } from 'knex'

const PASSWORD_HASH =
  '$argon2id$v=19$m=65536,t=2,p=1$lSFMuCOJFhG29cSC4eKm5WtZU8J4Bxa4WKxLXA/eklw$RbmuQT0EJ5qvLZp4ZaMeHxq6kqLPsNeJ2Q7aN3opXJk'

const COACH_EMAIL = 'arthur.amaral@outlook.com'

const BOX_MEMBERS = [
  {
    email: 'taina.pereira@gmail.com',
    first_name: 'Tainá',
    last_name: 'Pereira',
  },
  {
    email: 'taisa.alessio@outlook.com',
    first_name: 'Taisa',
    last_name: 'Alessio',
  },
  {
    email: 'tania.moreno@gmail.com',
    first_name: 'Tania',
    last_name: 'Mara Moreno',
  },
  {
    email: 'thamyres.sodre@outlook.com',
    first_name: 'Thamyres',
    last_name: 'De Moraes Sodré',
  },
  {
    email: 'tiago.airoso@gmail.com',
    first_name: 'Tiago',
    last_name: 'Nestor Airoso',
  },
  {
    email: 'valentina.tiepo@outlook.com',
    first_name: 'Valentina',
    last_name: 'Schizzi Tiepo',
  },
  {
    email: 'valeria.pinheiro@gmail.com',
    first_name: 'Valéria',
    last_name: 'Alaide Pinheiro',
  },
  {
    email: 'roberto.diedrich@outlook.com',
    first_name: 'Roberto',
    last_name: 'Ernesto Diedrich',
  },
  {
    email: 'rodrigo.silva@gmail.com',
    first_name: 'Rodrigo',
    last_name: 'Da Silva',
  },
  {
    email: 'rozendo.doria@outlook.com',
    first_name: 'Rozendo',
    last_name: 'Azevedo Doria',
  },
  {
    email: 'sabrina.souza@gmail.com',
    first_name: 'Sabrina',
    last_name: 'Erinete De Souza',
  },
  {
    email: 'sabrina.vargas@outlook.com',
    first_name: 'Sabrina',
    last_name: 'Soledad Vargas',
  },
  {
    email: 'sara.conceicao@gmail.com',
    first_name: 'Sara',
    last_name: 'Angélica Da Conceição',
  },
  {
    email: 'mirely.mendes@outlook.com',
    first_name: 'Mirely',
    last_name: 'Cristina Mendes',
  },
  {
    email: 'mires.fernandes@gmail.com',
    first_name: 'Mires',
    last_name: 'Fernandes',
  },
  {
    email: 'monica.backes@outlook.com',
    first_name: 'Monica',
    last_name: 'Backes',
  },
  {
    email: 'morgana.amorim@gmail.com',
    first_name: 'Morgana',
    last_name: 'Evellin De Amorim',
  },
  {
    email: 'naynajara.bittencourt@outlook.com',
    first_name: 'Naynajara',
    last_name: 'Bittencourt',
  },
  {
    email: 'nei.silva@gmail.com',
    first_name: 'Nei',
    last_name: 'Manoel Da Silva',
  },
  {
    email: 'guilherme.topanotti@outlook.com',
    first_name: 'Guilherme',
    last_name: 'Topanotti',
  },
  {
    email: 'guillermina.ciavatta@gmail.com',
    first_name: 'Guillermina',
    last_name: 'Ciavatta',
  },
  {
    email: 'gustavo.germano@outlook.com',
    first_name: 'Gustavo',
    last_name: 'Hilan Germano',
  },
  {
    email: 'ianca.silva@gmail.com',
    first_name: 'Ianca',
    last_name: 'Da Silva',
  },
  { email: 'igor.venske@outlook.com', first_name: 'Igor', last_name: 'Venske' },
  {
    email: 'clarice.inacio@gmail.com',
    first_name: 'Clarice',
    last_name: 'De Melo Inácio',
  },
  {
    email: 'clemilso.campos@outlook.com',
    first_name: 'Clemilso',
    last_name: 'De Oliveira Campos',
  },
  {
    email: 'cristiane.koeler@gmail.com',
    first_name: 'Cristiane',
    last_name: 'Koeler',
  },
  {
    email: 'daiana.silva@outlook.com',
    first_name: 'Daiana',
    last_name: 'A. Dos Santos Silva',
  },
  {
    email: 'daniel.martins@gmail.com',
    first_name: 'Daniel',
    last_name: 'Amilton Martins',
  },
  {
    email: 'daniel.crocoli@outlook.com',
    first_name: 'Daniel',
    last_name: 'Crocoli',
  },
  {
    email: 'andre.pinheiro@gmail.com',
    first_name: 'André',
    last_name: 'Luiz Da Silva Pinheiro',
  },
  { email: 'andrea.gill@outlook.com', first_name: 'Andrea', last_name: 'Gill' },
  {
    email: 'antonia.silva@gmail.com',
    first_name: 'Antônia',
    last_name: 'Justo Da Silva',
  },
  { email: COACH_EMAIL, first_name: 'Arthur', last_name: 'Augusto Do Amaral' },
  {
    email: 'barbara.martins@gmail.com',
    first_name: 'Barbara',
    last_name: 'Camila Martins',
  },
]

const MEMBER_EMAILS = BOX_MEMBERS.map((member) => member.email)

export async function up(knex: Knex): Promise<void> {
  if (process.env.NODE_ENV === 'test') return

  await knex('users')
    .insert(
      BOX_MEMBERS.map((member) => ({
        ...member,
        password: PASSWORD_HASH,
        is_admin: false,
        is_coach: member.email === COACH_EMAIL,
        is_active: true,
      }))
    )
    .onConflict('email')
    .merge({ is_active: true, deleted_at: null })
}

export async function down(knex: Knex): Promise<void> {
  await knex('users')
    .whereIn('email', MEMBER_EMAILS)
    .whereNotExists((builder) =>
      builder
        .select(knex.raw('1'))
        .from('checkins')
        .whereRaw('checkins.user_id = users.id')
    )
    .delete()
}
