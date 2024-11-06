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

class EmployeeResource < ApplicationResource
  self.model = Employee
  self.type = :employees

  attribute :first_name, :string
  attribute :last_name, :string
  attribute :age, :integer
  attribute :position, :string
  attribute :department_id, :integer

  # Define belongs_to association with DepartmentResource
  belongs_to :department

  # Define a custom attribute for department_name
  attribute :department_name, :string do
    @object.department&.name
  end

  # Define sortable attributes
  [:first_name, :last_name, :age, :position].each do |attr|
    sort attr, :string do |scope, direction|
      scope.order(attr => direction) if direction.present?
    end
  end

  # Custom filter to search by first or last name
  filter :name, :string do
    eq do |scope, value|
      EmployeeFilterService.new(scope).filter_by_name(value)
    end
  end

  # Custom filter to search by department name
  filter :department_name, :string do
    eq do |scope, value|
      EmployeeFilterService.new(scope).filter_by_department_name(value)
    end
  end

  def self.employee_data_with_pagination(params)
    # Extract pagination parameters safely
    page_params = params[:page] || {}
    current_page = page_params["number"].to_i > 0 ? page_params["number"].to_i : 1
    per_page = page_params["size"].to_i > 0 ? page_params["size"].to_i : 20

    # Fetch filtered employees 
    filtered_scope = all(params)

    # Calculate total count after filtering
    total_count = Employee.count
    total_pages = (total_count / per_page.to_f).ceil
    next_page = current_page < total_pages ? current_page + 1 : nil
    prev_page = current_page > 1 ? current_page - 1 : nil

    {
      data: filtered_scope,
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

class EmployeeFilterService
  def initialize(scope)
    @scope = scope
  end

  def filter_by_name(value)
    if value.is_a?(Array)
      value.map!(&:downcase)
      query = value.map { "LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ?" }.join(' OR ')
      conditions = value.flat_map { |v| ["%#{v}%", "%#{v}%"] }
      @scope.where(query, *conditions)
    else
      @scope.where("LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ?", "%#{value.downcase}%", "%#{value.downcase}%")
    end
  end

  def filter_by_department_name(value)
    if value.is_a?(Array)
      value.map!(&:downcase)
      query = value.map { "LOWER(departments.name) LIKE ?" }.join(' OR ')
      conditions = value.map { |v| "%#{v}%" }
      @scope.joins(:department).where(query, *conditions)
    else
      @scope.joins(:department).where("LOWER(departments.name) LIKE ?", "%#{value.downcase}%")
    end
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
  # get '/api/v1/employees' do
  #   employees_with_meta = EmployeeResource.employee_data_with_pagination(params)
  #   employees_with_meta.to_json
  # end

  get '/api/v1/employees' do
    employees = EmployeeResource.all(params)
    employees.to_jsonapi
  end


  get '/api/v1/employees/:id' do
    employee = EmployeeResource.find(params)
    employee.to_jsonapi
  end

  post '/api/v1/employees' do
    # Parse the JSON body data
    request_payload = JSON.parse(request.body.read, symbolize_names: true)
  
    # Extract the department name from the received data
    department_name = request_payload.dig(:data, :attributes, :department_name)
  
    # Find the department ID based on the department name
    department = Department.find_by(name: department_name)
  
    # Proceed only if the department exists
    if department
      # Replace department name with department ID in the payload
      request_payload[:data][:attributes][:department_id] = department.id
      request_payload[:data][:attributes].delete(:department_name) # Remove the name to avoid conflicts
  
      # Extract employee attributes from the payload
      first_name = request_payload.dig(:data, :attributes, :first_name)
      last_name = request_payload.dig(:data, :attributes, :last_name)
  
      # Check for duplicate employee in the same department (case insensitive)
      existing_employee = Employee.where(department_id: department.id)
        .find { |emp| emp.first_name.downcase == first_name.downcase && emp.last_name.downcase == last_name.downcase }
  
      if existing_employee
        status 400 # Bad Request
        return { errors: ["An employee with the name #{first_name} #{last_name} already exists in the #{department_name} department."] }.to_json
      end
  
      # Build and save the employee resource
      employee = EmployeeResource.build(request_payload)
  
      if employee.save
        status 201
        employee.to_jsonapi
      else
        status 422
        { errors: employee.errors.full_messages }.to_json
      end
    else
      status 422
      { errors: ["Failed to Add Employee. Please try again later or contact Technical service"] }.to_json
    end
  rescue JSON::ParserError => e
    status 400
    { errors: ["Failed to Add Employee. Please try again later or contact Technical service"] }.to_json
  rescue ActiveRecord::RecordInvalid => e
    status 422
    { errors: e.record.errors.full_messages }.to_json
  end
  
  
end

