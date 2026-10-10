# EduGenAI — Resource-Aware Image Generation Backend

EduGenAI is a backend system engineered for **Resource-Aware Image Generation**. Standard AI image generation expends uniform maximum computing power regardless of image purpose, keeping energy and computational costs invisible to users. EduGenAI introduces purpose-aware computational effort selection with transparent per-generation resource estimates and resource savings compared against a maximum-quality baseline.

## Problem Statement
- **Title**: Resource-Aware Image Generation
- **Problem**: AI image generation uses the same computing power regardless of what the image is for, and the energy cost is invisible to the user.
- **Solution**: Build a generation system that matches computational effort to the purpose of the image and shows the user what was saved by not generating at maximum quality.
- **Deliverable**: A working generation interface with at least two quality tiers (Economy & High Quality) and a visible resource estimate and savings per generation.

## Technology Stack
- **Runtime**: Node.js (JavaScript CommonJS)
- **Web Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Validation**: Zod
- **Queueing (Async Generation)**: Redis & BullMQ (with development fallback)
- **Testing**: Jest & Supertest
- **Logging**: Pino structured logger
