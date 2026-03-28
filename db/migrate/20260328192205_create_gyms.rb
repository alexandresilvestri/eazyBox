class CreateGyms < ActiveRecord::Migration[8.1]
  def change
    create_table :gyms do |t|
      t.string :name
      t.string :corporate_name

      t.timestamps
    end
  end
end
