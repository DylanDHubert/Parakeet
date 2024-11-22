from openai import OpenAI

KEY = "your-key-here"

def interact(messages, model="gpt-3.5-turbo"):
    """

    :param messages: Ex:    [
                                {"role": "system", "content": "INIT PROMPT HERE"},
                                {"role": "user", "content": "MESSAGE 1"}
                            ]
    :param model: OpenAI Model
    :return: response from OpenAI Model
    """
    client = OpenAI(api_key=KEY)
    completion = client.chat.completions.create(
        model=model,
        messages=messages)
    return completion.choices[0].message

