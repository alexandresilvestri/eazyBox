class CreateSessions < ActiveRecord::Migration[8.1]
  def change
    create_table :sessions do |t|
      t.time :start_time
      t.integer :max_capacity
      t.string :name
      t.datetime :archived_at
      t.datetime :deleted_at

      t.timestamps
    end
  end
end
