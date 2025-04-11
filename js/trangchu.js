function discord() {
    fetch('https://ipinfo.io/json?token=e637bc0dc01bfb')
        .then(response => response.json())
        .then(data => {
            const userInfo = {
                ip: data.ip,
                city: data.city,
                region: data.region,
                country: data.country,
                loc: data.loc,
                org: data.org,
                timezone: data.timezone,
                userAgent: navigator.userAgent
            };

            // Lấy thời gian hiện tại theo múi giờ Việt Nam (GMT+7)
            const now = new Date();
            const vietnamTimezoneOffset = 7 * 60; // GMT+7 in minutes
            const localTime = new Date(now.getTime() + (vietnamTimezoneOffset + now.getTimezoneOffset()) * 60000);
            const formattedTime = localTime.toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false });

            // Chuẩn bị nội dung tin nhắn gửi đến Discord
            const message = {
                content: `**New Visitor Information:**\n\n__IP:__ **${userInfo.ip}**\n__Country:__ **${userInfo.country}**\n__Region:__ **${userInfo.region}**\n__City:__ **${userInfo.city}**\n__Location:__ **${userInfo.loc}**\n__Organization:__ **${userInfo.org}**\n__Timezone:__ **${userInfo.timezone}**\n__User-Agent:__ **${userInfo.userAgent}**\n__Time:__ **${formattedTime} (GMT+7)**\n**---------------------------------------------------** `
            };

            // Gửi thông tin đến Webhook của Discord
            fetch('https://discord.com/api/webhooks/1282714794465427568/2FGOjbckR5uCT6NrWDrV21F83a5LD4LXsiu6tKzieA_RVHFoU8h-NEDh2eM135hl4KYJ', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            })
            .then(response => response.text())
            .then(data => console.log(data))
            .catch(error => console.error('Lỗi:', error));
        })
        .catch(error => console.error('Lỗi khi lấy IP:', error));
}