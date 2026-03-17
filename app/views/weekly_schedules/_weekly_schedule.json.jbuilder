json.extract! weekly_schedule, :id, :day_of_week, :start_time, :max_capacity, :created_at, :updated_at
json.url weekly_schedule_url(weekly_schedule, format: :json)
