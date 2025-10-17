
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center py-8 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 animate-gradient-text">
        Generator Opisów Celów z AI
      </h1>
      <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
        Wprowadź swoje cele i zadania z Jiry, a my stworzymy dla Ciebie profesjonalne opisy podkreślające Twoje osiągnięcia.
      </p>
    </header>
  );
};

export default Header;
