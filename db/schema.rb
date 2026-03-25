# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_03_25_012451) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "tenants", force: :cascade do |t|
    t.string "address"
    t.string "cnpj"
    t.string "corporate_name"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.string "representative_cpf"
    t.string "representative_name"
    t.integer "stripe_customer_id"
    t.datetime "updated_at", null: false
  end

  create_table "weekly_schedules", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "day_of_week"
    t.integer "max_capacity"
    t.string "start_time"
    t.datetime "updated_at", null: false
  end

  create_table "workouts", force: :cascade do |t|
    t.datetime "archived_at"
    t.datetime "created_at", null: false
    t.datetime "deleted_at"
    t.integer "max_capacity", null: false
    t.string "name", null: false
    t.time "start_time", null: false
    t.bigint "tenant_id", null: false
    t.datetime "updated_at", null: false
    t.index ["archived_at"], name: "index_workouts_on_archived_at"
    t.index ["deleted_at"], name: "index_workouts_on_deleted_at"
    t.index ["tenant_id"], name: "index_workouts_on_tenant_id"
  end

  add_foreign_key "workouts", "tenants"
end
