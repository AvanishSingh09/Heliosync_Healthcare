import { Request, Response } from 'express';
import { prisma } from '../config';
import { successResponse, errorResponse } from '../utils/response';
import { DocumentType, Role } from '../types';
import path from 'path';
import fs from 'fs';
import { logAudit } from '../services/audit.service';

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const file = req.file;

    if (!file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const { patientId, documentType = DocumentType.OTHER, description } = req.body;

    let targetPatientId = patientId;
    if (currentUser.role === Role.PATIENT) {
      targetPatientId = currentUser.patientId;
    }

    if (!targetPatientId) {
      return errorResponse(res, 'patientId is required', 400);
    }

    const docType = Object.values(DocumentType).includes(documentType)
      ? documentType
      : DocumentType.OTHER;

    const doc = await prisma.medicalDocument.create({
      data: {
        patientId: targetPatientId,
        uploadedBy: currentUser.name,
        documentType: docType,
        fileName: file.originalname,
        filePath: file.path.replace(/\\/g, '/'),
        description: description || null,
      },
    });

    await logAudit({
      userId: currentUser.id,
      patientId: targetPatientId,
      action: 'DOCUMENT_UPLOADED',
      resourceType: 'MedicalDocument',
      resourceId: doc.id,
      metadata: { fileName: file.originalname, documentType: docType },
    });

    return successResponse(res, doc, 'Document uploaded successfully', 201);
  } catch (error: any) {
    console.error('uploadDocument error:', error);
    return errorResponse(res, 'Failed to upload document', 500);
  }
};

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await prisma.medicalDocument.findUnique({
      where: { id },
    });

    if (!doc) {
      return errorResponse(res, 'Document not found', 404);
    }

    const resolvedPath = path.resolve(doc.filePath);
    if (!fs.existsSync(resolvedPath)) {
      return successResponse(res, doc, 'Document metadata retrieved');
    }

    return res.sendFile(resolvedPath);
  } catch (error: any) {
    return errorResponse(res, 'Failed to retrieve document', 500);
  }
};
