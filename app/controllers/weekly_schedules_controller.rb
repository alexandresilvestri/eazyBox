class WeeklySchedulesController < ApplicationController
  before_action :set_weekly_schedule, only: %i[ show edit update destroy ]

  def index
    @weekly_schedules = WeeklySchedule.all
  end

  def show
  end

  def new
    @weekly_schedule = WeeklySchedule.new
  end

  def edit
  end

  def create
    @weekly_schedule = WeeklySchedule.new(weekly_schedule_params)

    respond_to do |format|
      if @weekly_schedule.save
        format.html { redirect_to @weekly_schedule, notice: "Weekly schedule was successfully created." }
        format.json { render :show, status: :created, location: @weekly_schedule }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @weekly_schedule.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @weekly_schedule.update(weekly_schedule_params)
        format.html { redirect_to @weekly_schedule, notice: "Weekly schedule was successfully updated.", status: :see_other }
        format.json { render :show, status: :ok, location: @weekly_schedule }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @weekly_schedule.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @weekly_schedule.destroy!

    respond_to do |format|
      format.html { redirect_to weekly_schedules_path, notice: "Weekly schedule was successfully destroyed.", status: :see_other }
      format.json { head :no_content }
    end
  end

  private
    def set_weekly_schedule
      @weekly_schedule = WeeklySchedule.find(params.expect(:id))
    end

    def weekly_schedule_params
      params.expect(weekly_schedule: [ :day_of_week, :start_time, :max_capacity ])
    end
end
