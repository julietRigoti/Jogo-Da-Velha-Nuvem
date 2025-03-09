const BASE_URL = 'http://localhost:3000';

export const login = async (email, password) => {
    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    
    return response.json();
    };

export const signUp = async (email, password, nickname) => {
    const response = await fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, nickname }),
    });
    
    return response.json();
    };


    export const mockLogin = async (email, password) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true, token: "fake-jwt-token" });
          }, 1000);
        });
      };