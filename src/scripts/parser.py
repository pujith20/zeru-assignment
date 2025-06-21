# parser.py
import sys
import json

def process_log(data):
    # Example: Extract error lines only
    lines = data.split('\n')
    errors = [line for line in lines if 'ERROR' in line.upper()]
    return {"errors": errors, "count": len(errors)}

if __name__ == "__main__":
    input_data = sys.stdin.read()
    result = process_log(input_data)
    print(json.dumps(result))
