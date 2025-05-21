import { useState, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, timestamp } from "../firebase/config";
import { useAuthContext } from "./useAuthContext";

export const useSignup = () => {
  const [isCancelled, setIsCancelled] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { dispatch } = useAuthContext();

  const signup = async (email, password, name) => {
    setError(null);
    setIsPending(true);

    try {
      console.log("Iniciando processo de cadastro para:", email);
      
      // First check if email exists
      const methods = await fetchSignInMethodsForEmail(auth, email);
      
      // If methods array has length > 0, email exists
      if (methods.length > 0) {
        console.log("Email já está em uso:", email);
        setError("Esse e-mail já está em uso. Tente outro.");
        setIsPending(false);
        return;
      }
      
      console.log("Email disponível, criando usuário...");
      
      // Attempt to create the user
      const res = await createUserWithEmailAndPassword(auth, email, password);

      if (!res) {
        throw new Error("Não foi possível realizar o cadastro.");
      }

      console.log("Usuário criado com sucesso, UID:", res.user.uid);

      // Update user profile with name
      await updateProfile(auth.currentUser, { displayName: name });
      console.log("Perfil do usuário atualizado com nome:", name);

      // Create Firestore document without checking if it exists
      try {
        const userDocRef = doc(db, "users", res.user.uid);
        console.log("Criando documento no Firestore para usuário:", res.user.uid);
        
        // Create user document in Firestore
        await setDoc(userDocRef, {
          id: res.user.uid,
          online: true,
          createdAt: timestamp,
          email: email,
          name: name,
          accountStatus: 'active',
          lastLogin: timestamp
        });
        
        console.log("Documento do usuário criado com sucesso no Firestore");
      } catch (firestoreError) {
        console.error("Erro ao criar documento no Firestore:", firestoreError);
        // Não cancelamos o cadastro aqui, apenas logamos o erro
        // O usuário ainda foi criado na autenticação
      }

      // Dispatch login action
      dispatch({ type: "LOGIN", payload: res.user });
      console.log("Usuário logado automaticamente após cadastro");

      // Update state
      if (!isCancelled) {
        setIsPending(false);
        setError(null);
      }
    } catch (err) {
      // More detailed error handling
      console.error("Erro durante o signup:", err.code, err.message);
      
      let errorMessage;
      switch(err.code) {
        case "auth/email-already-in-use":
          errorMessage = "Esse e-mail já está em uso. Tente outro.";
          break;
        case "auth/weak-password":
          errorMessage = "A senha deve ter pelo menos 6 caracteres.";
          break;
        case "auth/invalid-email":
          errorMessage = "O e-mail informado é inválido.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "O cadastro com email e senha está desativado.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
          break;
        default:
          errorMessage = "Erro ao tentar criar a conta. Tente novamente mais tarde.";
      }

      if (!isCancelled) {
        setError(errorMessage);
        setIsPending(false);
      }
    }
  };

  useEffect(() => () => setIsCancelled(true), []);

  return { error, isPending, signup };
};