<?php
// Obtém os parâmetros da URL
$username = isset($_GET['username']) ? $_GET['username'] : '';
$password = isset($_GET['password']) ? $_GET['password'] : '';
$type = isset($_GET['type']) ? $_GET['type'] : '';

// Verifica as credenciais e o tipo
if ($username === 'admin' && $password === 'admin' && ($type === 'm3u_plus' || $type === 'm3u')) {
    // URL do arquivo .m3u no GitHub
    $m3u_url = 'https://raw.githubusercontent.com/Aldemirps/Maxptv/main/maximo.m3u';

    // Faz a requisição para o arquivo .m3u
    $response = file_get_contents($m3u_url);

    if ($response !== false) {
        // Define o cabeçalho para o tipo de conteúdo
        header('Content-Type: audio/x-mpegurl');
        echo $response;
        exit;
    } else {
        // Erro ao buscar o arquivo
        http_response_code(500);
        echo 'Erro ao buscar o arquivo .m3u';
        exit;
    }
} else {
    // Resposta para credenciais ou tipo inválidos
    http_response_code(401);
    echo 'Usuário ou senha inválidos ou tipo inválido.';
    exit;
}
?>