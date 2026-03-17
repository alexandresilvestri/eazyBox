class CreateWeeklySchedules < ActiveRecord::Migration[8.1]
  def change
    create_table :weekly_schedules do |t|
      t.integer :day_of_week
      t.string :start_time
      t.integer :max_capacity

      t.timestamps
    end
  end
end
