from setuptools import setup, find_packages

setup(
    name='ProgressPal',         # Replace with your project's name
    version='0.0.1',                 # Version of your project
    author='Levi van Es',               # Your name
    author_email='levi2234@hotmail.com',   # Your email address
    description='A web tqdm alternative',  # Short description
    long_description=open('README.md').read(),  # Long description from README
    long_description_content_type='text/markdown',  # Content type of long description
    url='TBA',  # URL to your project's repository
    packages=find_packages(where='src'),  # Automatically find packages in the src directory
    package_dir={'': 'src'},            # Source code is under src
    python_requires='>=3.10',            # Minimum Python version required
    install_requires=[                   # List of dependencies
        'pytest>=7.0',                  # Specify pytest as a dependency
        # Add other dependencies here
    ],
    extras_require={                    # Optional dependencies
        'dev': [
            'pytest-cov',               # Coverage for pytest
            # Add other development tools here
        ],
    },
    classifiers=[                       # Classifiers for the project
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    
        entry_points={
        'console_scripts': [
            'ProgressPal=ProgressPal.cli:CLI',
        ],
    },

)
