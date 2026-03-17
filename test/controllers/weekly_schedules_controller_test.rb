require "test_helper"

class WeeklySchedulesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @weekly_schedule = weekly_schedules(:one)
  end

  test "should get index" do
    get weekly_schedules_url
    assert_response :success
  end

  test "should get new" do
    get new_weekly_schedule_url
    assert_response :success
  end

  test "should create weekly_schedule" do
    assert_difference("WeeklySchedule.count") do
      post weekly_schedules_url, params: { weekly_schedule: { day_of_week: @weekly_schedule.day_of_week, max_capacity: @weekly_schedule.max_capacity, start_time: @weekly_schedule.start_time } }
    end

    assert_redirected_to weekly_schedule_url(WeeklySchedule.last)
  end

  test "should show weekly_schedule" do
    get weekly_schedule_url(@weekly_schedule)
    assert_response :success
  end

  test "should get edit" do
    get edit_weekly_schedule_url(@weekly_schedule)
    assert_response :success
  end

  test "should update weekly_schedule" do
    patch weekly_schedule_url(@weekly_schedule), params: { weekly_schedule: { day_of_week: @weekly_schedule.day_of_week, max_capacity: @weekly_schedule.max_capacity, start_time: @weekly_schedule.start_time } }
    assert_redirected_to weekly_schedule_url(@weekly_schedule)
  end

  test "should destroy weekly_schedule" do
    assert_difference("WeeklySchedule.count", -1) do
      delete weekly_schedule_url(@weekly_schedule)
    end

    assert_redirected_to weekly_schedules_url
  end
end
