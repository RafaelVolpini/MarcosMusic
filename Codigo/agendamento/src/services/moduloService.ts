export interface UploadModuloDTO {
  id: number;
  nome: string;
  descricao: string;
  url: string;
  idModulo: number;
}

export interface ModuloDTO {
  id: number;
  nome: string;
  uploads: UploadModuloDTO[];
}

export async function listarModulos(): Promise<ModuloDTO[]> {
  const res = await fetch('/upload-modulo/modulos', {
    method: 'GET',
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Erro ${res.status} ao listar módulos`);
  return res.json() as Promise<ModuloDTO[]>;
}

export async function obterModulo(id: number): Promise<ModuloDTO> {
  const res = await fetch(`/upload-modulo/modulo/${id}`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Erro ${res.status} ao obter módulo`);
  return res.json() as Promise<ModuloDTO>;
}

export async function criarModulo(nome: string): Promise<void> {
  const res = await fetch('/upload-modulo/modulo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ nome })
  });
  if (!res.ok) throw new Error(`Erro ${res.status} ao criar módulo`);
}

export async function uploadVideo(
  file: File,
  nome: string,
  descricao: string,
  idModulo: number,
  onProgress?: (percent: number) => void
): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('dto', JSON.stringify({
    nome,
    descricao,
    idModulo
  }));

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Erro ${xhr.status} ao fazer upload`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Erro na conexão ao fazer upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelado')));
    xhr.addEventListener('timeout', () => reject(new Error('Tempo limite excedido (5 min)')));

    // XHR não passa pelo interceptor de fetch — precisa da URL absoluta em produção
    const UPLOAD_BACKEND = import.meta.env.PROD ? 'https://marcosmusic-production.up.railway.app' : '';
    xhr.open('POST', `${UPLOAD_BACKEND}/upload-modulo/upload`);
    xhr.withCredentials = true;
    xhr.timeout = 5 * 60 * 1000; // 5 minutos
    xhr.send(formData);
  });
}

export async function atualizarVideo(id: number, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`/upload-modulo/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: formData
  });
  if (!res.ok) throw new Error(`Erro ${res.status} ao atualizar vídeo`);
}

export async function deletarVideo(id: number): Promise<void> {
  const res = await fetch(`/upload-modulo/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Erro ${res.status} ao deletar vídeo`);
}

export async function editarModulo(id: number, nome: string): Promise<void> {
  const res = await fetch(`/upload-modulo/modulo/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ nome })
  });
  if (!res.ok) throw new Error(`Erro ${res.status} ao editar módulo`);
}

export async function deletarModulo(id: number): Promise<void> {
  const res = await fetch(`/upload-modulo/modulo/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Erro ${res.status} ao deletar módulo`);
}
