import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SIGNUP_USER } from "../graphql/mutation";
import { useMutation } from "@apollo/client";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [gender, setGender] = useState("");
    const [error, setError] = useState("");
    let profilepic="";
    const [shake, setShake] = useState(false);
    const navigate = useNavigate();
    const boys =["43","50","32","8","41","7","9","25","11","29"]
    const girls=[74,56,61,64,98,94,97,73,71,100]
    let  bcount=0;
    let gcount=0;

    const [signupUser, { loading }] = useMutation(SIGNUP_USER, {
        onCompleted: () => navigate("/signin"),
        onError: (error) => setError(error.message),
    });

    const handleSignUp = () => {
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        const trimmedName = name.trim();
        const trimmedGender = gender.trim();

        // Basic validation
        if (!trimmedEmail || !trimmedPassword || !trimmedName || !trimmedGender) {
            setError("All fields are required.");
            triggerShake(["email", "password", "name", "gender"]);
            return;
        }

        // Validate email format
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(trimmedEmail)) {
            setError("Please enter a valid email address.");
            triggerShake(["email"]);
            return;
        }

        // Validate password strength
        if (trimmedPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            triggerShake(["password"]);
            return;
        }
    
        // Clear error
        setError("");
        if(gender === 'Male'){
            let Id=boys[bcount++]
            bcount%=11;
            profilepic = `https://avatar.iran.liara.run/public/${Id}`
        }
        else if(gender === 'Female'){
            let Id = girls[gcount++]
            gcount%=11;
            profilepic= `https://avatar.iran.liara.run/public/${Id}`
        }
        else{
            profilepic = `https://avatar.iran.liara.run/public`
        }

        signupUser({
            variables: {
                userNew: {
                    username: trimmedName,
                    email: trimmedEmail,
                    password: trimmedPassword,
                    gender: trimmedGender,
                    profilePicture:profilepic ,
                },
            },
        });
    };

    const triggerShake = (fieldsToClear = []) => {
        setShake(true);
        setTimeout(() => {
            setShake(false);
            if (fieldsToClear.includes("email")) setEmail("");
            if (fieldsToClear.includes("password")) setPassword("");
            if (fieldsToClear.includes("name")) setName("");
            if (fieldsToClear.includes("gender")) setGender("");
        }, 300);
    };

    return (
        <div
            className="auth-container"
            style={{
                position: "relative",
                width: "100%",
                height: "100vh",
                overflow: "hidden",
                backgroundImage: "url('/back.gif')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="card">
                <h1>Sign Up</h1>
                <input
                    type="text"
                    className={shake ? "shake" : ""}
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="email"
                    className={shake ? "shake" : ""}
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    className={shake ? "shake" : ""}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <select
                    className={shake ? "shake" : ""}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                >
                    <option value="" disabled>
                        Select Gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                <button onClick={handleSignUp} disabled={loading}>
                    {loading ? "Signing Up..." : "Sign Up"}
                </button>
                {error && <p className="error">{error}</p>}
                <p>
                    Already have an account? <a href="/signin">Sign In</a>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
