import { Express } from "express";
import express from 'express';
import user from './user.ts'

export default function (app: Express) {
    app
        .use(express.json())
        .use("/user", user)
}

// senhaMaravilhosa:aSabrinaÉLindaEMaravilhosa123