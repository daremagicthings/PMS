import axios from 'axios';
import prisma from '../lib/prisma';

/**
 * Communicates with local Ollama instance instead of Google API.
 * Uses the model requested by the user.
 */
export const getChatResponse = async (prompt: string, organizationId?: string | null) => {
    // Gather context
    let context = `Та бол СӨХ (Сууц өмчлөгчдийн холбоо)-н оршин суугчдад тусалдаг ухаалаг туслах юм. Таны зорилго бол оршин суугчдын асуултад эелдэг, тодорхой, товч хариулах.\n\n`;

    if (organizationId) {
        // Fetch FAQs
        const faqs = await prisma.faq.findMany({
            where: { organizationId }
        });
        if (faqs.length > 0) {
            context += `Түгээмэл асуултууд болон хариултууд:\n`;
            faqs.forEach(faq => {
                context += `Асуулт: ${faq.question}\nХариулт: ${faq.answer}\n\n`;
            });
        }

        // Fetch Static Content (Rules, Inquiries)
        const contents = await prisma.staticContent.findMany({
            where: { organizationId }
        });
        if (contents.length > 0) {
            context += `СӨХ-н мэдээлэл, дүрэм журам:\n`;
            contents.forEach(content => {
                context += `${content.title}:\n${content.content}\n\n`;
            });
        }
    }

    const fullPrompt = `${context}Дээрх мэдээлэлд үндэслэн дараах хэрэглэгчийн асуултад хариулна уу:\n\nХэрэглэгчийн асуулт: ${prompt}`;

    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'doomgrave/gemma3',
            prompt: fullPrompt,
            stream: false,
        });

        if (response.data && response.data.response) {
            return response.data.response;
        } else {
            throw new Error('Invalid response from Ollama');
        }
    } catch (error: any) {
        console.error('Ollama API Error:', error.message || error);
        throw new Error('Уучлаарай, хиймэл оюун ухаантай холбогдоход алдаа гарлаа (Орон нутгийн сервер).');
    }
};
