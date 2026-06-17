export type DocItem = {
    id: string;
    name: string;
    uploadedAt: string; // ISO date
    url: string;
};

async function fetchPdfBlob(url: string, token: string) {
    const headers = new Headers();
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include',
    });

    if (!response.ok) {
        let errorText = 'Unable to load document.';
        try {
            const data = await response.json();
            errorText = data.error || errorText;
        } catch {
            errorText = await response.text();
        }
        throw new Error(errorText);
    }

    return await response.blob();
}

export default function AvailableDocuments({ docs, token }: { docs: DocItem[]; token: string }) {
    async function previewDocument(doc: DocItem) {
        const previewWindow = window.open('', '_blank');
        if (!previewWindow) {
            alert('Unable to open the preview window.');
            return;
        }

        try {
            const blob = await fetchPdfBlob(doc.url, token);
            const url = window.URL.createObjectURL(blob);
            previewWindow.location.href = url;
            previewWindow.onload = () => {
                window.URL.revokeObjectURL(url);
            };
        } catch (error) {
            previewWindow.document.body.innerText = error instanceof Error ? error.message : 'Unable to load preview.';
            previewWindow.document.close();
        }
    }

    async function downloadDocument(doc: DocItem) {
        try {
            const blob = await fetchPdfBlob(doc.url, token);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${doc.name}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to download document.');
        }
    }

    return (
        <section className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-[#17210B]">Available Documents</h2>
            <p className="text-sm text-[#4B5540] mt-2">Download certificates, company documents, and launch files.</p>

            <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 xl:grid-cols-3">
                {docs.map(d => (
                    <article key={d.id} className="flex min-h-[190px] flex-col rounded-lg border border-[#D9DBCD] bg-white p-5 shadow-sm transition hover:border-[#8CC444]">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h3 className="break-words text-lg font-bold leading-snug text-[#17210B]">{d.name}</h3>
                                <p className="mt-2 text-[13px] text-[#6A725F]">Uploaded {new Date(d.uploadedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="ml-auto flex-shrink-0">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#D6139F] text-[11px] font-bold text-white">DOC</div>
                            </div>
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-3 pt-5">
                            <button
                                type="button"
                                onClick={() => previewDocument(d)}
                                className="min-h-11 rounded-full border border-[#D9DBCD] bg-white px-4 py-2 text-sm font-bold text-[#102000] transition hover:border-[#8CC444]"
                            >
                                Preview
                            </button>
                            <button
                                type="button"
                                onClick={() => downloadDocument(d)}
                                className="min-h-11 rounded-full bg-[#8CC444] px-4 py-2 text-center text-sm font-bold text-[#102000] transition hover:bg-[#7EB33D]"
                            >
                                Download
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
