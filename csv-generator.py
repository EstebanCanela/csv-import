import csv
import random
import string

def generate_random_name(length):
    """Generate a random name with given length."""
    return ''.join(random.choice(string.ascii_uppercase + string.ascii_lowercase) for _ in range(length))

def generate_email(first_name, last_name):
    """Generate a random email based on first and last name."""
    domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com']
    email_formats = [
        f"{first_name.lower()}{last_name.lower()}@{random.choice(domains)}",
        f"{first_name.lower()}.{last_name.lower()}@{random.choice(domains)}",
        f"{last_name.lower()}{first_name.lower()}@{random.choice(domains)}",
        f"{random.randint(1, 999)}{first_name.lower()}{last_name.lower()}@{random.choice(domains)}"
    ]
    return random.choice(email_formats)

def generate_csv(filename, num_rows):
    """Generate a CSV file with specified number of rows."""
    with open(filename, 'w', newline='') as csvfile:
        csvwriter = csv.writer(csvfile)
        
        # Write header
        csvwriter.writerow(['email', 'last_name', 'firstName'])
        
        # Generate rows
        for _ in range(num_rows):
            last_name = generate_random_name(random.randint(4, 10))
            first_name = generate_random_name(random.randint(4, 10))
            email = generate_email(first_name, last_name)
            
            csvwriter.writerow([email, last_name, first_name])
    
    print(f"CSV file generated with {num_rows} rows.")

# Generate 1 million rows
generate_csv('user_data.csv', 1_000_000)