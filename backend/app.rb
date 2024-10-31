require 'faker'
require 'active_record'
require './seeds'
require 'kaminari'
require 'sinatra/base'
require 'graphiti'
require 'graphiti/adapters/active_record'

class ApplicationResource < Graphiti::Resource
  self.abstract_class = true
  self.adapter = Graphiti::Adapters::ActiveRecord
  self.base_url = 'http://localhost:4567'
  self.endpoint_namespace = '/api/v1'
  # implement Graphiti.config.context_for_endpoint for validation
  self.validate_endpoints = false
end

class DepartmentResource < ApplicationResource
  self.model = Department
  self.type = :departments

  attribute :name, :string
end

# employee_resource.rb
class EmployeeResource < ApplicationResource
  self.model = Employee
  self.type = :employees

  attribute :first_name, :string
  attribute :last_name, :string
  attribute :age, :integer
  attribute :position, :string
  attribute :department_id, :integer

  # Enable pagination with Kaminari
  paginate do |scope, current_page, per_page|
    scope.page(current_page).per(per_page)
  end

  # Custom filter to search by first or last name
  filter :name, :string do
    eq do |scope, value|
      scope.where("first_name ILIKE ? OR last_name ILIKE ?", "%#{value}%", "%#{value}%")
    end
  end

  def self.employee_data_with_pagination(params)
   # Extract pagination parameters safely
   page_params = params[:page] || {}
   current_page = page_params["number"].to_i > 0 ? page_params["number"].to_i : 1 # Ensure current_page is at least 1
   per_page = page_params["size"].to_i > 0 ? page_params["size"].to_i : 10 # Default per_page to 10

   # Fetch employees based on the current page and per_page
   employees = all(params)
   
   total_count = Employee.count # Count total number of employees
   total_pages = (total_count / per_page.to_f).ceil # Calculate total pages
   next_page = current_page < total_pages ? current_page + 1 : nil
   prev_page = current_page > 1 ? current_page - 1 : nil
    {
      data: employees,
      meta: {
        total_count: total_count,
        total_pages: total_pages,
        current_page: current_page,
        next_page: next_page,
        prev_page: prev_page
      }
    }
  end
end


Graphiti.setup!

# main application file
class EmployeeDirectoryApp < Sinatra::Application
  configure do
    mime_type :jsonapi, 'application/vnd.api+json'
  end

  before do
    content_type :jsonapi
  end

  after do
    ActiveRecord::Base.connection_handler.clear_active_connections!
  end

  # Department Endpoints
  get '/api/v1/departments' do
    departments = DepartmentResource.all(params)
    departments.to_jsonapi
  end

  get '/api/v1/departments/:id' do
    department = DepartmentResource.find(params)
    department.to_jsonapi
  end

  # Employee Endpoints
  get '/api/v1/employees' do
    employees_with_meta = EmployeeResource.employee_data_with_pagination(params)
    employees_with_meta.to_json
  end


  get '/api/v1/employees/:id' do
    employee = EmployeeResource.find(params)
    employee.to_jsonapi
  end
end


