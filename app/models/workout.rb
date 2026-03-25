class Workout < ApplicationRecord
  include Discard::Model
  self.discard_column = :deleted_at

  belongs_to :tenant
end
