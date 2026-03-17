class WeeklySchedulesController < ApplicationController
  before_action :set_weekly_schedule, only: %i[ show edit update destroy ]

  # GET /weekly_schedules or /weekly_schedules.json
  def index
    @weekly_schedules = WeeklySchedule.all
  end

  # GET /weekly_schedules/1 or /weekly_schedules/1.json
  def show
  end

  # GET /weekly_schedules/new
  def new
    @weekly_schedule = WeeklySchedule.new
  end

  # GET /weekly_schedules/1/edit
  def edit
  end

  # POST /weekly_schedules or /weekly_schedules.json
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

  # PATCH/PUT /weekly_schedules/1 or /weekly_schedules/1.json
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

  # DELETE /weekly_schedules/1 or /weekly_schedules/1.json
  def destroy
    @weekly_schedule.destroy!

    respond_to do |format|
      format.html { redirect_to weekly_schedules_path, notice: "Weekly schedule was successfully destroyed.", status: :see_other }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_weekly_schedule
      @weekly_schedule = WeeklySchedule.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def weekly_schedule_params
      params.expect(weekly_schedule: [ :day_of_week, :start_time, :max_capacity ])
    end
end
