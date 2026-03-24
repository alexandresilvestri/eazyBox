class SessionsController < ApplicationController
  before_action :set_session, only: %i[ show edit update destroy ]

  def index
    @sessions = Session.all
  end

  def show
  end

  def new
    @session = Session.new
  end

  def edit
  end

  def create
    @session = Session.new(session_params)

    respond_to do |format|
      if @session.save
        format.html { redirect_to @session, notice: "Session was successfully created." }
        format.json { render :show, status: :created, location: @session }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @session.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @session.update(session_params)
        format.html { redirect_to @session, notice: "Session was successfully updated.", status: :see_other }
        format.json { render :show, status: :ok, location: @session }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @session.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @session.destroy!

    respond_to do |format|
      format.html { redirect_to sessions_path, notice: "Session was successfully destroyed.", status: :see_other }
      format.json { head :no_content }
    end
  end

  private
    def set_session
      @session = Session.find(params.expect(:id))
    end

    def session_params
      params.expect(session: [ :start_time, :max_capacity, :name ])
    end
end
