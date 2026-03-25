require 'rails_helper'

RSpec.describe "workouts/show", type: :view do
  let(:tenant) { Tenant.create!(name: "Test Tenant", corporate_name: "Corp", cnpj: "123", address: "Addr", representative_name: "Rep", representative_cpf: "456") }

  before(:each) do
    assign(:workout, Workout.create!(
      tenant: tenant,
      name: "Name",
      start_time: "10:00",
      max_capacity: 2
    ))
  end

  it "renders attributes in <p>" do
    render
    expect(rendered).to match(//)
    expect(rendered).to match(/Name/)
    expect(rendered).to match(/2/)
  end
end
