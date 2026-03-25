require 'rails_helper'

RSpec.describe "workouts/edit", type: :view do
  let(:tenant) { Tenant.create!(name: "Test Tenant", corporate_name: "Corp", cnpj: "123", address: "Addr", representative_name: "Rep", representative_cpf: "456") }
  let(:workout) {
    Workout.create!(
      tenant: tenant,
      name: "MyString",
      start_time: "10:00",
      max_capacity: 1
    )
  }

  before(:each) do
    assign(:workout, workout)
  end

  it "renders the edit workout form" do
    render

    assert_select "form[action=?][method=?]", workout_path(workout), "post" do
      assert_select "input[name=?]", "workout[tenant_id]"

      assert_select "input[name=?]", "workout[name]"

      assert_select "input[name=?]", "workout[max_capacity]"
    end
  end
end
