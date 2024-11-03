ActiveRecord::Base.establish_connection adapter: 'sqlite3',
                                        database: 'sqlite3:employee-directory.sqlite3'

seeded = !ActiveRecord::Base.connection.tables.empty?

unless seeded
  ActiveRecord::Migration.verbose = true
  ActiveRecord::Schema.define(version: 1) do
    create_table :employees do |t|
      t.string :first_name
      t.string :last_name
      t.integer :age
      t.string :position
      t.integer :department_id, index: true
    end

    create_table :departments do |t|
      t.string :name
    end
  end
end

class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
end

class Employee < ApplicationRecord
  belongs_to :department

   # Validation to ensure an employee with the same name doesn't exist in the same department
   validates :first_name, :last_name, :department_id, presence: true
   validate :unique_name_within_department
 
   private
 
   def unique_name_within_department
     if Employee.exists?(first_name: first_name, last_name: last_name, department_id: department_id)
       errors.add(:base, "An employee with the same name already exists in this department")
     end
   end
end

class Department < ApplicationRecord
  has_many :employees
end

unless seeded
  departments = [
    Department.create!(name: 'Engineering'),
    Department.create!(name: 'Product'),
    Department.create!(name: 'Legal'),
    Department.create!(name: 'Marketing'),
    Department.create!(name: 'Sales'),
    Department.create!(name: 'Support'),
    Department.create!(name: 'HR'),
    Department.create!(name: 'Finance'),
    Department.create!(name: 'Operations'),
    Department.create!(name: 'IT')
  ]

  1000.times do
    Employee.create!(
      first_name: Faker::Name.first_name,
      last_name: Faker::Name.last_name,
      age: rand(18..65),
      position: Faker::Job.title,
      department: departments.sample
    )
  end
end
