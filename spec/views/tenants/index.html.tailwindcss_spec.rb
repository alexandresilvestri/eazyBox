require 'rails_helper'

RSpec.describe "tenants/index", type: :view do
  before(:each) do
    assign(:tenants, [
      Tenant.create!(
        stripe_customer_id: 2,
        name: "Name",
        corporate_name: "Corporate Name",
        cnpj: "Cnpj",
        address: "Address",
        representative_name: "Representative Name",
        representative_cpf: "Representative Cpf"
      ),
      Tenant.create!(
        stripe_customer_id: 2,
        name: "Name",
        corporate_name: "Corporate Name",
        cnpj: "Cnpj",
        address: "Address",
        representative_name: "Representative Name",
        representative_cpf: "Representative Cpf"
      )
    ])
  end

  it "renders a list of tenants" do
    render
    expect(rendered).to match(/Name/)
    expect(rendered).to match(/Corporate Name/)
    expect(rendered).to match(/Cnpj/)
    expect(rendered).to match(/Address/)
    expect(rendered).to match(/Representative Name/)
    expect(rendered).to match(/Representative Cpf/)
  end
end
