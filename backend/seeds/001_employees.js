export function seed(knex) {
  return knex('employees').del()
    .then(() => {
      return knex('employees').insert([
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@worksense.com',
          phone: '+1-555-0101',
          photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          job_title: 'Software Engineer',
          department: 'Engineering',
          skills: 'JavaScript, React, Node.js, PostgreSQL',
          certifications: 'AWS Certified Developer, React Certification',
          emergency_contact_name: 'Jane Doe',
          emergency_contact_phone: '+1-555-0102',
          emergency_contact_relationship: 'Spouse',
          employee_id: 'EMP001',
          hire_date: '2023-01-15',
          birth_date: '1990-05-20',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip_code: '10001',
          country: 'USA'
        },
        {
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@worksense.com',
          phone: '+1-555-0103',
          photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          job_title: 'Product Manager',
          department: 'Product',
          skills: 'Product Strategy, User Research, Agile, Analytics',
          certifications: 'Certified Scrum Master, Product Management Certification',
          emergency_contact_name: 'Mike Johnson',
          emergency_contact_phone: '+1-555-0104',
          emergency_contact_relationship: 'Spouse',
          employee_id: 'EMP002',
          hire_date: '2022-08-10',
          birth_date: '1988-12-03',
          address: '456 Oak Ave',
          city: 'San Francisco',
          state: 'CA',
          zip_code: '94102',
          country: 'USA'
        },
        {
          first_name: 'Michael',
          last_name: 'Chen',
          email: 'michael.chen@worksense.com',
          phone: '+1-555-0105',
          photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          job_title: 'UX Designer',
          department: 'Design',
          skills: 'UI/UX Design, Figma, Prototyping, User Testing',
          certifications: 'Google UX Design Certificate',
          emergency_contact_name: 'Lisa Chen',
          emergency_contact_phone: '+1-555-0106',
          emergency_contact_relationship: 'Sister',
          employee_id: 'EMP003',
          hire_date: '2023-03-22',
          birth_date: '1992-07-14',
          address: '789 Pine St',
          city: 'Seattle',
          state: 'WA',
          zip_code: '98101',
          country: 'USA'
        }
      ]);
    });
}
