#!/usr/bin/env python3
"""
Generate sample resume PDFs for the TalentForge seed data.

The seeded student profiles store a `resume` URL. For the AI resume-scoring
feature to work offline (and in the README's local-demo flow), those URLs must
point at *real* PDFs with extractable text -- not example.com placeholders.

This script builds one minimal single-page PDF per student, whose text mirrors
the student's seeded profile (skills, projects, experience) so keyword +
semantic scoring produces meaningful, non-trivial numbers.

Usage:
    python scripts/generate_sample_resumes.py

Output:
    frontend/public/resumes/<student>-resume.pdf
    (served by the CRA dev server at http://localhost:3000/resumes/<student>-resume.pdf)

The targeted students' `resume` fields in seed.js reference exactly these files.
"""

import os
import re
import struct
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "..", "..", "frontend", "public", "resumes")

STUDENTS = [
    {
        "file": "aarav-resume",
        "name": "Aarav Mehta",
        "email": "aarav@talentforge.com",
        "phone": "+91 98200 11234",
        "location": "Mumbai, India",
        "degree": "B.Tech",
        "branch": "Computer Science",
        "college": "IIT Bombay",
        "grad": "2025",
        "skills": ["Python", "TensorFlow", "SQL", "Pandas", "NLP"],
        "projects": [
            "Movie Recommender System - collaborative filtering with cosine similarity on 100k MovieLens ratings",
            "Sentiment Analyzer - LSTM model for real-time sentiment classification of streaming text",
        ],
        "experience": [
            "ML Intern, Sprinklr (3 months) - built classification pipelines and lightweight model serving",
        ],
        "certs": ["AWS Machine Learning Specialty, 2024"],
        "summary": "Machine learning engineering intern focused on NLP and applied deep learning.",
    },
    {
        "file": "priya-resume",
        "name": "Priya Sharma",
        "email": "priya@talentforge.com",
        "phone": "+91 98401 55221",
        "location": "Trichy, India",
        "degree": "B.Tech",
        "branch": "Information Technology",
        "college": "NIT Trichy",
        "grad": "2024",
        "skills": ["React", "Node.js", "MongoDB", "TypeScript", "Tailwind"],
        "projects": [
            "QuickMart E-commerce - full-stack MERN app with Stripe payments and real-time inventory",
            "LiveChat App - WebSocket chat with rooms, typing indicators and read receipts",
        ],
        "experience": [
            "Frontend Intern, Freshworks (6 months) - shipped UI features in React and maintained a design system",
        ],
        "certs": ["Meta Frontend Developer, 2023"],
        "summary": "Frontend engineer skilled in modern React, TypeScript and scalable Node.js APIs.",
    },
    {
        "file": "rohan-resume",
        "name": "Rohan Gupta",
        "email": "rohan@talentforge.com",
        "phone": "+91 98340 77812",
        "location": "Vellore, India",
        "degree": "B.Tech",
        "branch": "Computer Science",
        "college": "VIT Vellore",
        "grad": "2025",
        "skills": ["Java", "Spring Boot", "AWS", "MySQL", "Docker"],
        "projects": [
            "Inventory Management System - Spring Boot REST API with role-based access and JUnit tests",
            "URL Shortener - distributed service with Redis caching and an analytics dashboard",
        ],
        "experience": [
            "Java Intern, Infosys (2 months) - implemented Spring Boot services and wrote integration tests",
        ],
        "certs": ["Oracle Java SE 17, 2024"],
        "summary": "Backend developer building production Java and Spring Boot services on AWS.",
    },
    {
        "file": "ananya-resume",
        "name": "Ananya Patel",
        "email": "ananya@talentforge.com",
        "phone": "+91 99530 11289",
        "location": "New Delhi, India",
        "degree": "B.Tech",
        "branch": "Electronics & Communication",
        "college": "DTU - Delhi Technological University",
        "grad": "2024",
        "skills": ["Python", "Django", "PostgreSQL", "Docker", "Redis"],
        "projects": [
            "DevBlog Platform - markdown blog with comments, tags and SEO metadata",
            "TaskFlow Manager - kanban task manager with drag-and-drop and team workspaces",
        ],
        "experience": [
            "Backend Intern, Publicis Sapient (4 months) - Django APIs and PostgreSQL schema design",
        ],
        "certs": ["Docker Essentials, 2024"],
        "summary": "Python developer with a focus on Django, PostgreSQL and containerized deployment.",
    },
    {
        "file": "kavya-resume",
        "name": "Kavya Singh",
        "email": "kavya@talentforge.com",
        "phone": "+91 99010 44332",
        "location": "Hyderabad, India",
        "degree": "B.Tech",
        "branch": "Computer Science",
        "college": "IIIT Hyderabad",
        "grad": "2025",
        "skills": ["Go", "React", "Redis", "Kafka", "gRPC"],
        "projects": [
            "Real-time Chat Engine - Go microservices with Kafka pub/sub and a WebSocket gateway",
            "URL Shortener - high-performance shortener in Go with BoltDB and rate limiting",
        ],
        "experience": [
            "Backend Intern, Paytm (3 months) - built Go services and integrated Kafka event streams",
        ],
        "certs": ["Go: The Complete Developer's Guide, 2024"],
        "summary": "Systems-oriented engineer working in Go with event-driven microservices.",
    },
    {
        "file": "arjun-resume",
        "name": "Arjun Nair",
        "email": "arjun@talentforge.com",
        "phone": "+91 90042 77890",
        "location": "Pilani, India",
        "degree": "B.E.",
        "branch": "Computer Science",
        "college": "BITS Pilani",
        "grad": "2024",
        "skills": ["C++", "Data Structures", "Algorithms", "Operating Systems", "Linux"],
        "projects": [
            "Cache Simulator - L1/L2 cache with LRU and LFU eviction, validated on SPEC traces",
            "In-memory File System - FUSE filesystem supporting mkdir, cp, ls and permissions",
        ],
        "experience": [],
        "certs": ["CS50, Harvard / edX, 2022"],
        "summary": "Computer science graduate with strong foundations in data structures and systems programming.",
    },
    {
        "file": "sneha-resume",
        "name": "Sneha Reddy",
        "email": "sneha@talentforge.com",
        "phone": "+91 99620 33411",
        "location": "Chennai, India",
        "degree": "B.Tech",
        "branch": "Computer Science",
        "college": "SRM University",
        "grad": "2025",
        "skills": ["Flutter", "Firebase", "Dart", "Figma", "REST APIs"],
        "projects": [
            "ExpenseWise - cross-platform expense tracker with charts, budgets and CSV export",
            "FoodBox Delivery - food delivery app with real-time order tracking and payments",
        ],
        "experience": [
            "UI/UX Intern, Zoho (2 months) - prototyped mobile flows in Figma and shipped Flutter screens",
        ],
        "certs": ["Google UX Design, 2024"],
        "summary": "Mobile app developer building Flutter applications backed by Firebase and REST APIs.",
    },
    {
        "file": "manish-resume",
        "name": "Manish Kumar",
        "email": "manish@talentforge.com",
        "phone": "+91 91100 22876",
        "location": "Warangal, India",
        "degree": "B.Tech",
        "branch": "Computer Science",
        "college": "NIT Warangal",
        "grad": "2025",
        "skills": ["React", "Python", "FastAPI", "PostgreSQL", "Docker"],
        "projects": [
            "QuizMaster Live - real-time quiz platform with leaderboards and WebSockets",
            "JobBoard Lite - job board with AI resume scoring and email notifications",
        ],
        "experience": [],
        "certs": ["AWS Cloud Practitioner, 2024"],
        "summary": "Full-stack developer blending React frontends with Python FastAPI backends.",
    },
    {
        "file": "tanvi-resume",
        "name": "Tanvi Joshi",
        "email": "tanvi@talentforge.com",
        "phone": "+91 98230 66543",
        "location": "Pune, India",
        "degree": "BCS",
        "branch": "Computer Science",
        "college": "Savitribai Phule Pune University",
        "grad": "2024",
        "skills": ["PHP", "Laravel", "MySQL", "JavaScript", "Bootstrap"],
        "projects": [
            "Campus CMS - college content management with role-based pages and a media library",
            "QuickPoll - real-time polling app with charts and QR sharing",
        ],
        "experience": [
            "Web Dev Intern, TCS (3 months) - Laravel modules and MySQL-backed reporting",
        ],
        "certs": ["Laravel from Scratch, 2023"],
        "summary": "Web developer building Laravel applications with MySQL and vanilla JavaScript.",
    },
    {
        "file": "deepak-resume",
        "name": "Deepak Verma",
        "email": "deepak@talentforge.com",
        "phone": "+91 99770 88241",
        "location": "Noida, India",
        "degree": "B.Tech",
        "branch": "Information Technology",
        "college": "JIIT Noida",
        "grad": "2025",
        "skills": ["Java", "Kotlin", "Android", "Firebase", "Jetpack Compose"],
        "projects": [
            "FitTrack - fitness Android app with step counter, calorie log and workout plans",
            "NoteVault - offline-first notes app with Markdown and Firestore sync",
        ],
        "experience": [
            "Android Intern, Paytm (2 months) - Kotlin components and Firebase integration",
        ],
        "certs": ["Android Development with Kotlin, 2024"],
        "summary": "Android developer building Kotlin and Jetpack Compose apps on Firebase.",
    },
]


def escape_pdf_text(text):
    """Escape a PDF text-string literal."""
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def wrap(text, width=84):
    """Word-wrap a line of plain text to ~width chars for the fixed-width font."""
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if len(candidate) <= width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def build_resume_lines(student):
    lines = []
    lines += [student["name"].upper(), ""]
    header = f'{student["email"]}  |  {student["phone"]}  |  {student["location"]}'
    lines += wrap(header)
    lines += ["", "SUMMARY", "-" * 40, student["summary"], ""]
    lines += ["EDUCATION", "-" * 40, f'{student["degree"]} - {student["branch"]}']
    lines += [f'{student["college"]}, Graduation {student["grad"]}', ""]
    lines += ["SKILLS", "-" * 40, ", ".join(student["skills"]), ""]
    lines += ["PROJECTS", "-" * 40]
    for p in student["projects"]:
        lines += wrap(f"* {p}")
    lines += [""]
    lines += ["EXPERIENCE", "-" * 40]
    if student["experience"]:
        for e in student["experience"]:
            lines += wrap(f"* {e}")
    else:
        lines += ["* No prior work experience."]
    lines += [""]
    lines += ["CERTIFICATIONS", "-" * 40]
    for c in student["certs"]:
        lines += wrap(f"* {c}")
    return lines


def make_pdf(text_lines):
    """Build a minimal single-page PDF (Helvetica, standard-14) that pdfplumber can parse."""
    content_ops = ["BT", "/F1 11 Tf", "50 720 Td", "15 TL"]
    for line in text_lines:
        content_ops.append(f"({escape_pdf_text(line)}) Tj")
        content_ops.append("T*")
    content_ops.append("ET")
    stream_data = "\n".join(content_ops).encode("latin-1")

    compressed = zlib.compress(stream_data)

    objects = []
    catalog = b"1 0 obj\n<</Type /Catalog /Pages 2 0 R>>\nendobj\n"
    pages = b"2 0 obj\n<</Type /Pages /Kids [3 0 R] /Count 1>>\nendobj\n"
    page = b"3 0 obj\n<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources <</Font <</F1 4 0 R>>>> /Contents 5 0 R>>\nendobj\n"
    font = b"4 0 obj\n<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>\nendobj\n"
    content = (
        f"5 0 obj\n<</Length {len(compressed)} /Filter /FlateDecode>>\nstream\n"
    ).encode("latin-1") + compressed + b"\nendstream\nendobj\n"

    objects = [catalog, pages, page, font, content]

    pdf = b"%PDF-1.4\n"
    offsets = []
    for obj in objects:
        offsets.append(len(pdf))
        pdf += obj

    xref_pos = len(pdf)
    pdf += f"xref\n0 {len(objects) + 1}\n".encode("latin-1")
    pdf += b"0000000000 65535 f \n"
    for off in offsets:
        pdf += f"{off:010d} 00000 n \n".encode("latin-1")

    pdf += (
        f"trailer\n<</Size {len(objects) + 1} /Root 1 0 R>>\n"
        f"startxref\n{xref_pos}\n%%EOF\n"
    ).encode("latin-1")
    return pdf


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for student in STUDENTS:
        pdf = make_pdf(build_resume_lines(student))
        path = os.path.join(OUT_DIR, student["file"] + ".pdf")
        with open(path, "wb") as fh:
            fh.write(pdf)
        print(f"wrote {os.path.relpath(path, os.path.join(HERE, '..', '..'))}  ({len(pdf)} bytes)")
    print(f"\n{len(STUDENTS)} resumes written to {os.path.normpath(OUT_DIR)}")


if __name__ == "__main__":
    main()