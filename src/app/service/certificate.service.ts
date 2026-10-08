import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from '@angular/fire/firestore';
import { Certificate, compareCertificates } from '../models/certificate';

const COLLECTION = 'certificates';

@Injectable({
  providedIn: 'root',
})
export class CertificateService {
  constructor(private firestore: Firestore) {}

  async list(): Promise<Certificate[]> {
    const snapshot = await getDocs(collection(this.firestore, COLLECTION));
    return snapshot.docs
      .map((item) => this.normalise(item.id, item.data()))
      .sort(compareCertificates);
  }

  async create(certificate: Certificate): Promise<void> {
    const { id, ...data } = certificate;
    await addDoc(collection(this.firestore, COLLECTION), data);
  }

  async update(id: string, changes: Partial<Certificate>): Promise<void> {
    const { id: _ignored, ...data } = changes;
    await updateDoc(doc(this.firestore, COLLECTION, id), { ...data });
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, COLLECTION, id));
  }

  private normalise(id: string, data: any): Certificate {
    return {
      id,
      slug: data.slug || id,
      title: data.title || '',
      issuer: data.issuer || '',
      issuedOn: data.issuedOn || '',
      credentialUrl: data.credentialUrl || '',
      credentialId: data.credentialId || '',
      description: data.description || '',
      skills: Array.isArray(data.skills) ? data.skills : [],
      fileUrl: data.fileUrl || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: data.createdAt || 0,
    };
  }
}
