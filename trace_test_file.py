
def hello_world():
    """Print a simple greeting message."""
    print("Hello, World!")

class Person:
    """A simple Person class."""
    
    def __init__(self, name, age):
        """Initialize with name and age."""
        self.name = name
        self.age = age
        
    def greet(self):
        """Return a greeting message."""
        return f"Hello, my name is {self.name} and I am {self.age} years old."
