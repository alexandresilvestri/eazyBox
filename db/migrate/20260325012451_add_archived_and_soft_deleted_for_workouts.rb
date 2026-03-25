class AddArchivedAndSoftDeletedForWorkouts < ActiveRecord::Migration[8.1]
  def change
		add_column :workouts, :archived_at, :datetime
		add_column :workouts, :deleted_at, :datetime

		add_index :workouts, :archived_at
		add_index :workouts, :deleted_at
  end
end
