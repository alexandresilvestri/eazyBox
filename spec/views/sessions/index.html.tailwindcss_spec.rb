require 'rails_helper'

RSpec.describe "sessions/index", type: :view do
  before(:each) do
    assign(:sessions, [
      Session.create!(
        max_capacity: 2,
        name: "Name"
      ),
      Session.create!(
        max_capacity: 2,
        name: "Name"
      )
    ])
  end

  it "renders a list of sessions" do
    render
    cell_selector = 'div>p'
    assert_select cell_selector, text: Regexp.new(2.to_s), count: 2
    assert_select cell_selector, text: Regexp.new("Name".to_s), count: 2
  end
end
