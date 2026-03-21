json.extract! session, :id, :start_time, :max_capacity, :name, :archived_at, :deleted_at, :created_at, :updated_at
json.url session_url(session, format: :json)
